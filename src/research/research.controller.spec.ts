import { Test, TestingModule } from '@nestjs/testing';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';

describe('ResearchController', () => {
  let controller: ResearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResearchController],
      providers: [ResearchService],
    }).compile();

    controller = module.get<ResearchController>(ResearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
