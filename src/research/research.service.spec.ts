import { Test, TestingModule } from '@nestjs/testing';
import { ResearchService } from './research.service';

describe('ResearchService', () => {
  let service: ResearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResearchService],
    }).compile();

    service = module.get<ResearchService>(ResearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
