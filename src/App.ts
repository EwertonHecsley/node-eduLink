import app from ".";
import EnviromentValidator from "./enviromentsValidate";

const logger = app.log;

export class App{
    private readonly port = Number(process.env.PORT);

    async bootstrap(){
        this.validate();
        this.startServer();
        this.handleGracefulShutdown();
    }

    private validate(){
        new EnviromentValidator().validateEnviromentsVariables();
    }

    private async startServer() {
    await app.listen({ port: this.port });
    logger.info(`🟢  Server is running on port ${this.port}`);
  }

  private handleGracefulShutdown() {
    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: shutting down...');
      await app.close();
      process.exit(0);
    });
  }
}