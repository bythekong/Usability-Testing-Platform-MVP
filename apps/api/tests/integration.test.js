const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-only-secret-change-me';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:password@localhost:5432/usability_db?schema=public';

const { app } = require('../dist/app.js');
const { prisma } = require('../dist/db.js');

let server;
let baseUrl;

async function request(path, options = {}) {
  const response = await fetch(baseUrl + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

function auth(token) {
  return { Authorization: 'Bearer ' + token };
}

async function register(email, role) {
  const response = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password: 'password123',
      role
    })
  });

  assert.equal(response.status, 201);
  return response.data;
}

async function createCampaign(token, suffix = '') {
  const response = await request('/campaigns', {
    method: 'POST',
    headers: auth(token),
    body: JSON.stringify({
      targetUrl: 'https://example.com/' + suffix,
      rewardAmount: 1000,
      tasks: [
        { instruction: 'Find the About section' },
        { instruction: 'Scroll to the bottom of the page' }
      ]
    })
  });

  assert.equal(response.status, 201);
  return response.data;
}

async function resetDatabase() {
  await prisma.taskResponse.deleteMany();
  await prisma.jobAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.testCampaign.deleteMany();
  await prisma.user.deleteMany();
}

test.before(async () => {
  await resetDatabase();
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const address = server.address();
      baseUrl = 'http://127.0.0.1:' + address.port;
      resolve();
    });
  });
});

test.after(async () => {
  await resetDatabase();
  await prisma.$disconnect();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('MVP vertical slice enforces auth, ownership, and lifecycle integrity', async (t) => {
  const owner = await register('owner@example.com', 'OWNER');
  const otherOwner = await register('other-owner@example.com', 'OWNER');
  const testerOne = await register('tester-one@example.com', 'TESTER');
  const testerTwo = await register('tester-two@example.com', 'TESTER');

  await t.test('role authorization rejects cross-role actions', async () => {
    const testerCreatesCampaign = await request('/campaigns', {
      method: 'POST',
      headers: auth(testerOne.token),
      body: JSON.stringify({
        targetUrl: 'https://example.com',
        rewardAmount: 1000,
        tasks: [{ instruction: 'Unauthorized attempt' }]
      })
    });
    assert.equal(testerCreatesCampaign.status, 403);

    const ownerReadsJobs = await request('/jobs/available', {
      headers: auth(owner.token)
    });
    assert.equal(ownerReadsJobs.status, 403);
  });

  const campaign = await createCampaign(owner.token, 'primary');
  const jobId = campaign.jobs[0].id;
  const taskIds = campaign.tasks
    .sort((a, b) => a.stepOrder - b.stepOrder)
    .map((task) => task.id);

  let winningTester;
  let losingTester;

  await t.test('concurrent job claim has exactly one winner', async () => {
    const [first, second] = await Promise.all([
      request('/jobs/' + jobId + '/claim', {
        method: 'POST',
        headers: auth(testerOne.token)
      }),
      request('/jobs/' + jobId + '/claim', {
        method: 'POST',
        headers: auth(testerTwo.token)
      })
    ]);

    const results = [
      { response: first, tester: testerOne },
      { response: second, tester: testerTwo }
    ];

    const winners = results.filter((item) => item.response.status === 200);
    const losers = results.filter((item) => item.response.status === 409);

    assert.equal(winners.length, 1);
    assert.equal(losers.length, 1);
    winningTester = winners[0].tester;
    losingTester = losers[0].tester;
  });

  const foreignCampaign = await createCampaign(owner.token, 'foreign');
  const foreignTaskId = foreignCampaign.tasks[0].id;

  await t.test('submission rejects foreign and duplicate task IDs', async () => {
    const foreign = await request('/jobs/' + jobId + '/submit', {
      method: 'POST',
      headers: auth(winningTester.token),
      body: JSON.stringify({
        responses: [
          { taskId: taskIds[0], answerText: 'valid task' },
          { taskId: foreignTaskId, answerText: 'foreign task' }
        ]
      })
    });
    assert.equal(foreign.status, 400);

    const duplicate = await request('/jobs/' + jobId + '/submit', {
      method: 'POST',
      headers: auth(winningTester.token),
      body: JSON.stringify({
        responses: [
          { taskId: taskIds[0], answerText: 'first' },
          { taskId: taskIds[0], answerText: 'duplicate' }
        ]
      })
    });
    assert.equal(duplicate.status, 400);

    const loserSubmit = await request('/jobs/' + jobId + '/submit', {
      method: 'POST',
      headers: auth(losingTester.token),
      body: JSON.stringify({
        responses: taskIds.map((taskId) => ({ taskId, answerText: 'not mine' }))
      })
    });
    assert.equal(loserSubmit.status, 403);
  });

  await t.test('valid submission is recorded once and owner can inspect it', async () => {
    const submitted = await request('/jobs/' + jobId + '/submit', {
      method: 'POST',
      headers: auth(winningTester.token),
      body: JSON.stringify({
        responses: [
          { taskId: taskIds[0], answerText: 'About was easy to find.' },
          { taskId: taskIds[1], answerText: 'Footer was clear.' }
        ]
      })
    });
    assert.equal(submitted.status, 200);

    const duplicateSubmit = await request('/jobs/' + jobId + '/submit', {
      method: 'POST',
      headers: auth(winningTester.token),
      body: JSON.stringify({
        responses: taskIds.map((taskId) => ({ taskId, answerText: 'duplicate' }))
      })
    });
    assert.equal(duplicateSubmit.status, 409);

    const unauthorizedReview = await request('/jobs/' + jobId + '/review', {
      headers: auth(otherOwner.token)
    });
    assert.equal(unauthorizedReview.status, 403);

    const review = await request('/jobs/' + jobId + '/review', {
      headers: auth(owner.token)
    });
    assert.equal(review.status, 200);
    assert.equal(review.data.responses.length, 2);
    assert.equal(review.data.responses[0].task.stepOrder, 1);
    assert.equal(review.data.responses[0].answerText, 'About was easy to find.');
  });

  await t.test('review transition is owner-only and can happen only once', async () => {
    const unauthorizedApprove = await request('/jobs/' + jobId + '/review', {
      method: 'POST',
      headers: auth(otherOwner.token),
      body: JSON.stringify({ status: 'APPROVED' })
    });
    assert.equal(unauthorizedApprove.status, 403);

    const approved = await request('/jobs/' + jobId + '/review', {
      method: 'POST',
      headers: auth(owner.token),
      body: JSON.stringify({ status: 'APPROVED' })
    });
    assert.equal(approved.status, 200);
    assert.equal(approved.data.status, 'APPROVED');
    assert.ok(approved.data.reviewedAt);

    const secondReview = await request('/jobs/' + jobId + '/review', {
      method: 'POST',
      headers: auth(owner.token),
      body: JSON.stringify({ status: 'REJECTED' })
    });
    assert.equal(secondReview.status, 409);
  });

  await t.test('concurrent double submission yields one success', async () => {
    const secondCampaign = await createCampaign(owner.token, 'double-submit');
    const secondJobId = secondCampaign.jobs[0].id;
    const secondTaskIds = secondCampaign.tasks
      .sort((a, b) => a.stepOrder - b.stepOrder)
      .map((task) => task.id);

    const claim = await request('/jobs/' + secondJobId + '/claim', {
      method: 'POST',
      headers: auth(winningTester.token)
    });
    assert.equal(claim.status, 200);

    const payload = JSON.stringify({
      responses: secondTaskIds.map((taskId, index) => ({
        taskId,
        answerText: 'answer ' + index
      }))
    });

    const [first, second] = await Promise.all([
      request('/jobs/' + secondJobId + '/submit', {
        method: 'POST',
        headers: auth(winningTester.token),
        body: payload
      }),
      request('/jobs/' + secondJobId + '/submit', {
        method: 'POST',
        headers: auth(winningTester.token),
        body: payload
      })
    ]);

    const statuses = [first.status, second.status].sort();
    assert.deepEqual(statuses, [200, 409]);
  });
});
