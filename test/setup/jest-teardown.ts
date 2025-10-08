import { removePostgresContainer } from './testcontainer';

export default async () => {
  await removePostgresContainer();
};
