import { RmqOptions, Transport } from '@nestjs/microservices';

export const getRmqOptions = (queue: string): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://oktay:secret123@rabbitmq:5672'],
    queue,
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'order_retry_exchange',
      },
    },
    exchange: 'order_exchange',
    exchangeType: 'topic',
    noAck: true,
  },
});
