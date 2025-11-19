import chalk from 'chalk';

class Logger {
  info(message, data = '') {
    console.log(chalk.blue('[INFO]'), message, data);
  }

  success(message, data = '') {
    console.log(chalk.green('[SUCCESS]'), message, data);
  }

  error(message, data = '') {
    console.log(chalk.red('[ERROR]'), message, data);
  }

  warn(message, data = '') {
    console.log(chalk.yellow('[WARN]'), message, data);
  }

  debug(message, data = '') {
    if (process.env.NODE_ENV === 'development') {
      console.log(chalk.gray('[DEBUG]'), message, data);
    }
  }

  separator() {
    console.log(chalk.gray('='.repeat(60)));
  }

  header(title) {
    this.separator();
    console.log(chalk.bold.cyan(title));
    this.separator();
  }
}

export default new Logger();
