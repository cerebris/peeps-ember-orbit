import {
  LogTruncationStrategy
} from '@orbit/coordinator';

export default {
  create() {
    return new LogTruncationStrategy();
  }
};
