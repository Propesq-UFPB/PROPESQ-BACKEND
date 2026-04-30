import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import type { CurrentUserPayload } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto, LoginUserDto } from './dto/login-response.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Autenticações')
@Controller('authentications')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Realiza o login do usuário e retorna o token de acesso' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Login realizado com sucesso.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciais inválidas.',
  })
  @Post('sessions')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dados do usuário autenticado retornados com sucesso.',
    type: LoginUserDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuário não autenticado.',
  })
  @Get('users/me')
  getCurrentUser(@CurrentUser() user: CurrentUserPayload): LoginUserDto {
    return {
      id: user.userId,
      email: user.email,
      nome: user.nome,
      funcao: user.funcao ?? '',
    };
  }

  @Public()
  @ApiOperation({ summary: 'Cria um novo usuário para autenticação' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário criado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'E-mail já cadastrado.',
  })
  @Post('users')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
