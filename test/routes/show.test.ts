import { HTTP_STATUS } from "../../src/utils/const";
import { TestFactory } from "../factory";
import { mockShows } from "../mocks/data";

const CREATE_SHOW_ROUTE = '/show/create'

describe('Show routes', () => {
    const factory = new TestFactory();

    beforeAll(async () => {
        await factory.init();
    });

    afterAll(async () => {
        await factory.close();
    });

    afterEach(async () => {
        await factory.reset();
    });

    describe('POST /show/create',() => {
        it('should create a new show', async () => {
            const response = await factory.app.post(CREATE_SHOW_ROUTE).send(mockShows.valid);

            expect(response.status).toBe(HTTP_STATUS.CREATED);
            expect(response.body).toMatchObject({
                message: 'Show successfully created',
                data: {
                    id: mockShows.valid.id,
                    title: mockShows.valid.title,
                    date: mockShows.valid.date
                }
            });
            expect(response.body.data).toHaveProperty('id');
        })

        it('should return 400 for missing required fields', async () => {
            const response = await factory.app.post(CREATE_SHOW_ROUTE).send(mockShows.invalid);

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(response.body).toHaveProperty('errors');
        })
    })
})
