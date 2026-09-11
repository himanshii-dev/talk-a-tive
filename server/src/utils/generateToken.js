import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'talkative_default_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};
