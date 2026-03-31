import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 1, description: 'Identificador do usuário autenticado.' })
  id!: number;

  @ApiProperty({ example: 'admin@example.com', description: 'E-mail do usuário autenticado.' })
  email!: string;

  @ApiProperty({ example: 'Administrador', description: 'Nome do usuário autenticado.' })
  nome!: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJub21lIjoiQWRtaW5pc3RyYWRvciJ9.signature',
    description: 'Token JWT de acesso.',
  })
  accessToken!: string;

  @ApiProperty({ type: LoginUserDto, description: 'Dados do usuário autenticado.' })
  user!: LoginUserDto;
}
