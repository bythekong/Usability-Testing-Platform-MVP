import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(name + ' is required');
  }
  return value;
}

export const config = {
  jwtSecret: required('JWT_SECRET'),
  port: Number(process.env.PORT || 4000),
};
