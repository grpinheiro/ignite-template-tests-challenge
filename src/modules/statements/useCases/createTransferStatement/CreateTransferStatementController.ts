import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export class CreateTransferStatementController {
  async execute(request: Request, response: Response) {
    const {user_id} = request.params;
    const {id} = request.user;
    const {amount, description} = request.body;

    const createTransferStatement = container.resolve(CreateTransferStatementUseCase);

    const transfer = await createTransferStatement.execute({
      user_id,
      sender_id: id,
      type: 'transfer' as OperationType,
      amount,
      description
    });

    return response.status(201).json(transfer);
  }
}
