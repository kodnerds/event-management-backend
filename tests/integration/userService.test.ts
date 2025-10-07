import {AppDataSource} from '../../src/data-source'
import { User } from '../../src/entity/User'

describe('User Repository - Integration Test',() => {
    beforeAll(async () => {
        await  AppDataSource.initialize();
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    it('Should insert and fetch a user from the database',async () =>{
        const userRepo = AppDataSource.getRepository(User);

        const user = userRepo.create({firstName:'Craven',lastName:'Hunter', age:1})
        await userRepo.save(user)

        const response = await userRepo.findOneBy({firstName:'Craven'})
        expect(response).toBeDefined();
        expect(response?.firstName).toBe('Craven')
    })
})