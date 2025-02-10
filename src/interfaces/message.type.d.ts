import { HttpStatus } from "@nestjs/common"

    interface IMessage  {
    message:string,
    statusCode: HttpStatus
}