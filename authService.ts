import bcrypt from 'bcryptjs';
import { UserService, UserDTO } from './userService';
import { generateToken, AuthUser } from '../middleware/authMiddleware';

export class AuthService {
  /**
   * Autentica usuário por e-mail e senha
   */
  static async login(email?: string, senha?: string): Promise<{ user: UserDTO; token: string }> {
    if (!email || !email.trim()) {
      throw new Error('Informe o e-mail de acesso.');
    }
    if (!senha) {
      throw new Error('Informe a senha de acesso.');
    }

    const userWithHash = await UserService.findByEmail(email);
    if (!userWithHash) {
      throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    const isPasswordValid = await bcrypt.compare(senha, userWithHash.senha_hash);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    const authUser: AuthUser = {
      id: userWithHash.id,
      nome: userWithHash.nome,
      email: userWithHash.email,
    };

    const token = generateToken(authUser);

    return {
      user: {
        id: userWithHash.id,
        nome: userWithHash.nome,
        email: userWithHash.email,
        data_criacao: userWithHash.data_criacao,
      },
      token,
    };
  }

  /**
   * Registra e efetua login automático retornando usuário e token
   */
  static async register(nome: string, email: string, senha: string, confirmacao_senha: string): Promise<{ user: UserDTO; token: string }> {
    const validationError = UserService.validateRegisterInput(nome, email, senha, confirmacao_senha);
    if (validationError) {
      throw new Error(validationError);
    }

    const user = await UserService.create(nome, email, senha);
    const token = generateToken({
      id: user.id,
      nome: user.nome,
      email: user.email,
    });

    return { user, token };
  }
}
