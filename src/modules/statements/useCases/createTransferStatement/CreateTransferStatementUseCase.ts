import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

@injectable()
class CreateTransferStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ){}

  async execute({user_id, sender_id, type, amount, description}: ICreateStatementDTO) {
    // Validar se id foi preenchido
    if(!sender_id){
      throw new CreateStatementError.UserNotFound();
    }

    // Validar se o usuário remetente existe
    const sending_user = await this.usersRepository.findById(sender_id);

    if(!sending_user){
      throw new CreateStatementError.UserNotFound();
    }

    // Validar se a transferência é par a mesma conta
    if(sender_id === user_id){
      throw new CreateStatementError.OwnAccount();
    }

    // Validar se o usuário destinatário existe
    const recipient_user = await this.usersRepository.findById(user_id);

    if(!recipient_user){
      throw new CreateStatementError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({user_id: sender_id});

    if(balance < amount){
      throw new CreateStatementError.InsufficientFunds();
    }

    await this.statementsRepository.create({
      user_id: sender_id,
      type: 'withdraw' as OperationType,
      amount,
      description,
    })

    const statementOperation = await this.statementsRepository.create({
      user_id,
      sender_id,
      type,
      amount,
      description
    });

    return statementOperation;
  }

}

export { CreateTransferStatementUseCase }
