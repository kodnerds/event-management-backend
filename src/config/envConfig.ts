import { cleanEnv, port, str } from 'envalid';
import 'dotenv/config';

const envConfig = cleanEnv(process.env, {
  PORT: port(),
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  POSTGRES_USER: str({ default: undefined }),
  POSTGRES_PASSWORD: str({ default: undefined }),
  POSTGRES_DB: str({ default: undefined }),
  POSTGRES_PORT: port({ default: undefined }),
  POSTGRES_HOST: str({ default: undefined }),
  LOG_LEVEL: str({ default: 'debug' })
});

const extendedEnvConfig = {
  ...envConfig,
  get isTest() {
    return envConfig.NODE_ENV === 'test';
  }
};

export default extendedEnvConfig;
