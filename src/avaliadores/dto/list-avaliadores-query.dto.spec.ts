import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListAvaliadoresQueryDto } from './list-avaliadores-query.dto';

const parse = async (query: Record<string, string>) => {
  const dto = plainToInstance(ListAvaliadoresQueryDto, query);
  const errors = await validate(dto);
  return { dto, campos: errors.map(e => e.property) };
};

describe('ListAvaliadoresQueryDto', () => {
  it('applies the defaults', async () => {
    const { dto, campos } = await parse({});
    expect(campos).toEqual([]);
    expect(dto).toMatchObject({ limit: 10, offset: 0 });
  });

  it('converts query strings to numbers and booleans', async () => {
    const { dto, campos } = await parse({
      limit: '25',
      offset: '50',
      ativo: 'false',
      is_cnpq: 'true',
      area_principal_id: '7',
      area_adicional_id: '8',
    });
    expect(campos).toEqual([]);
    expect(dto).toMatchObject({
      limit: 25,
      offset: 50,
      ativo: false,
      is_cnpq: true,
      area_principal_id: 7,
      area_adicional_id: 8,
    });
  });

  it('rejects invalid values', async () => {
    const { campos } = await parse({
      limit: '101',
      offset: '-1',
      ativo: 'sim',
      area_principal_id: '0',
    });
    expect(campos.sort()).toEqual(['area_principal_id', 'ativo', 'limit', 'offset']);
  });
});
