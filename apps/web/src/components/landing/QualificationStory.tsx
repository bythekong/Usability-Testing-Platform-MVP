'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion';
import { Check, Mic2 } from 'lucide-react';
import { TypeLine } from './TypeLine';

const interviewImages = [
  {
    src: '/home_image/ai_qualification_interview_001.webp',
    alt: 'A participant and researcher beginning a structured usability research interview in a calm contemporary research studio.',
  },
  {
    src: '/home_image/ai_qualification_interview_002.webp',
    alt: 'A participant explaining how they compare digital products during a structured research screening interview.',
  },
  {
    src: '/home_image/ai_qualification_interview_003.webp',
    alt: 'A participant discussing a task on a personal device while a researcher observes the study-relevant context.',
  },
  {
    src: '/home_image/ai_qualification_interview_004.webp',
    alt: 'A focused research interview representing a participant context aligned with the study criteria.',
  },
] as const;

const fallbackImage = interviewImages[0];

const criteria = [
  ['Mobile banking experience', 'MATCH'],
  ['Android user', 'MATCH'],
  ['Think-aloud preference', 'AVAILABLE'],
  ['Previous product usage', 'NONE'],
] as const;

function stageFromProgress(progress: number) {
  if (progress < 0.25) return 0;
  if (progress < 0.5) return 1;
  if (progress < 0.75) return 2;
  return 3;
}

export function QualificationStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState(0);
  const [failedImages, setFailedImages] = useState<number[]>([]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (reduceMotion) return;
    const next = stageFromProgress(latest);
    setStage((current) => (current === next ? current : next));
  });

  const desktopStage = reduceMotion ? 3 : stage;
  const activeImage = failedImages.includes(desktopStage)
    ? fallbackImage
    : interviewImages[desktopStage];
  const visibleCriteriaCount = desktopStage + 1;

  const markImageFailed = (index: number) => {
    setFailedImages((current) =>
      current.includes(index) ? current : [...current, index]
    );
  };

  return (
    <section
      id="qualification"
      ref={sectionRef}
      className="landing-scene landing-light-scene landing-pin-qualification relative overflow-clip bg-[var(--lab-bone)] text-[var(--lab-ink)] lg:min-h-[300vh]"
    >
      <div
        aria-hidden="true"
        className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-[rgba(169,101,80,.09)] blur-3xl"
      />

      {/* Preload future hard-cut frames. Missing assets fail silently and fall back to 001. */}
      <div aria-hidden="true" className="hidden">
        {interviewImages.slice(1).map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            alt=""
            width={1}
            height={1}
            loading="eager"
            onError={() => markImageFailed(index + 1)}
          />
        ))}
      </div>

      <div className="landing-pinned-stage container relative mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 md:py-28 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:py-8">
        <div className="grid w-full items-center gap-10 md:gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14 xl:gap-20">
          <div className="lg:self-center">
            <p className="font-research inline-flex rounded-full border border-[var(--lab-light-border)] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.15em] text-[var(--lab-muted)]">
              Planned research capability
            </p>

            <h2 className="font-display mt-6 max-w-[8.5ch] text-[clamp(3rem,5.4vw,4.75rem)] font-semibold leading-[0.96] tracking-[-0.05em]">
              <TypeLine duration={0.72} fromY={24}>
                Find the people
              </TypeLine>
              <TypeLine delay={0.08} duration={0.76} fromY={26}>
                who fit the question.
              </TypeLine>
            </h2>

            <p className="mt-7 max-w-[34rem] text-base leading-7 text-[#5f6064] md:text-lg md:leading-8">
              Good research starts with the right context. We&apos;re designing
              AI-assisted screening to structure study-relevant information before
              a participant enters a test.
            </p>

            <div className="mt-7 max-w-[31rem] border-l border-[var(--lab-oxide)]/40 pl-4">
              <p className="text-sm leading-6 text-[#68686b]">
                AI can organize interview context and explicit study criteria.
              </p>
              <p className="mt-1 text-sm font-medium leading-6 text-[#4f5054]">
                Researchers decide who belongs in the study.
              </p>
            </div>
          </div>

          <div className="relative lg:h-[74vh] lg:min-h-[580px] lg:max-h-[720px]">
            {/* Desktop staged image: direct source swap, intentionally no image transition. */}
            <div className="relative hidden overflow-hidden rounded-[2rem] border border-[var(--lab-light-border)] bg-[#ddd5c9] shadow-[0_30px_80px_rgba(37,31,24,.14)] lg:block">
              <div className="relative aspect-[3/2]">
                <Image
                  key={activeImage.src}
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  priority={desktopStage === 0}
                  sizes="(min-width: 1280px) 720px, 58vw"
                  className="object-cover"
                  style={{ objectPosition: '50% 50%' }}
                  onError={() => markImageFailed(desktopStage)}
                />
              </div>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/16 via-transparent to-white/6"
              />

              <div className="absolute left-5 top-5 rounded-full border border-white/25 bg-black/25 px-3 py-1.5 font-research text-[8px] uppercase tracking-[0.14em] text-white/78 backdrop-blur-md">
                Research interview / live context
              </div>

              <div
                className="absolute bottom-5 left-5 flex items-center gap-1.5"
                aria-label={`Interview context stage ${desktopStage + 1} of 4`}
              >
                {interviewImages.map((image, index) => (
                  <span
                    key={image.src}
                    className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ${
                      index === desktopStage
                        ? 'w-5 bg-white/85'
                        : 'w-1.5 bg-white/35'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Mobile/tablet fallback: stable first frame, no cinematic pin sequence. */}
            <div className="relative overflow-hidden rounded-[1.6rem] border border-[var(--lab-light-border)] bg-[#ddd5c9] shadow-[0_24px_65px_rgba(37,31,24,.12)] lg:hidden">
              <div className="relative aspect-[3/2]">
                <Image
                  src={fallbackImage.src}
                  alt={fallbackImage.alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: '50% 50%' }}
                />
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/14 via-transparent to-white/6"
              />
              <div className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/25 px-3 py-1.5 font-research text-[8px] uppercase tracking-[0.14em] text-white/78 backdrop-blur-md">
                Research interview / live context
              </div>
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
              className="relative -mt-14 ml-auto w-[96%] max-w-xl overflow-hidden rounded-[1.35rem] border border-[var(--lab-light-border)] bg-[rgba(243,239,231,.97)] shadow-[0_28px_70px_rgba(34,29,23,.16)] backdrop-blur-xl sm:-mt-16 md:-mt-20 md:mr-4 lg:-mt-24 lg:mr-5"
            >
              <div className="flex items-center justify-between border-b border-[var(--lab-light-border)] px-5 py-4">
                <div>
                  <p className="font-research text-[9px] uppercase tracking-[0.16em] text-[var(--lab-oxide)]">
                    Research interview
                  </p>
                  <p className="mt-1 text-sm font-semibold">Question 03 / 05</p>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-[#656569]">
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    {!reduceMotion && (
                      <motion.span
                        aria-hidden="true"
                        animate={{
                          opacity: [0.18, 0.48, 0.18],
                          scale: [0.82, 1.2, 0.82],
                        }}
                        transition={{
                          duration: 1.9,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="absolute inset-0 rounded-full bg-[rgba(169,101,80,.16)]"
                      />
                    )}
                    <Mic2 className="relative h-3.5 w-3.5 text-[var(--lab-oxide)]" />
                  </span>
                  Listening…
                </div>
              </div>

              <div className="p-5 md:p-6">
                <p className="max-w-lg text-lg font-medium leading-7 tracking-[-0.015em]">
                  “Tell us how you normally compare subscription plans before
                  making a decision.”
                </p>

                <p className="mt-3 text-xs leading-5 text-[#727277]">
                  Structured response context is captured for the study — not used
                  to score the person.
                </p>

                <div className="mt-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-research text-[9px] uppercase tracking-[0.16em] text-[#77777b]">
                      Study context
                    </p>
                    <p className="hidden font-research text-[8px] uppercase tracking-[0.12em] text-[#98989c] lg:block">
                      Context pass {String(desktopStage + 1).padStart(2, '0')} / 04
                    </p>
                  </div>

                  <div className="mt-3 divide-y divide-black/8 border-y border-black/8">
                    {criteria.map(([label, value], index) => {
                      const visible = reduceMotion || index < visibleCriteriaCount;
                      const current = !reduceMotion && index === desktopStage;

                      return (
                        <motion.div
                          key={label}
                          animate={{
                            opacity: visible ? 1 : 0.24,
                            backgroundColor: current
                              ? 'rgba(127,137,120,.11)'
                              : visible
                                ? 'rgba(127,137,120,.04)'
                                : 'rgba(127,137,120,0)',
                          }}
                          transition={{
                            duration: 0.3,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="flex items-center justify-between gap-5 px-2 py-3"
                        >
                          <span
                            className={`text-sm ${
                              visible ? 'text-[#55565a]' : 'text-[#8c8d91]'
                            }`}
                          >
                            {label}
                          </span>

                          <motion.span
                            animate={
                              current
                                ? { scale: [0.97, 1.045, 1] }
                                : { scale: 1 }
                            }
                            transition={{
                              duration: 0.34,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className={`font-research inline-flex items-center gap-1.5 text-[9px] font-medium tracking-[0.1em] ${
                              visible
                                ? 'text-[var(--lab-sage)]'
                                : 'text-[#aaa]'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            {value}
                          </motion.span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <p className="font-research text-[9px] uppercase tracking-[0.12em] text-[#85858a]">
                    Context organized · Researcher review required
                  </p>
                  <span
                    aria-hidden="true"
                    className="hidden h-1.5 w-1.5 rounded-full bg-[var(--lab-sage)] md:block"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
