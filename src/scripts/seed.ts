import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SeederModule } from "src/database/seeder/seeder.module";
import { SeederService } from "src/database/seeder/seeder.service";

async function seed() {
  NestFactory.createApplicationContext(SeederModule)
    .then(appContext => {
      const logger = appContext.get(Logger);
      const seeder = appContext.get(SeederService)
      seeder
        .seed()
        .then(() => {
          logger.debug('Seeding complete!');
        })
        .catch(error => {
          logger.error('Seeding failed!');          
          throw error;
        })
        .finally(() => appContext.close());
    })
    .catch(error => {
      throw error;
    });
}

seed();