export default async function globalTeardown() {
    const containers = (global as any).__TEST_CONTAINER__;
    if (containers) {
        console.log("Stopping Containers")
        await containers.postgres.stop();
        await containers.redis.stop()

        console.log('Testcontainer stopped');
    }
}