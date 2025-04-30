import React from 'react';
import { Icon } from 'hzero-ui';
import styles from './index.less';

export default () => {
  return (
    <div className={styles.container}>
      <div>
        <Icon type='smile-o' className={styles.icon} />
        <p className={styles.description}>
          功能建设中，敬请期待！
          <br />
          Construction in progress,please stay tuned!
        </p>
      </div>
    </div>
  );
};
