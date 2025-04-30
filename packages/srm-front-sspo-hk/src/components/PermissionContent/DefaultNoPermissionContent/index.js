import React from 'react';
import { Icon } from 'hzero-ui';

import intl from 'utils/intl';

import styles from './index.less';

export default () => {
  return (
    <div className={styles.container}>
      <div>
        <Icon type="frown-o" className={styles.icon} />
        <p className={styles.description}>
          {intl.get('hzero.common.view.noPermission').d('暂无查看权限，请联系管理员申请权限后重试')}
        </p>
      </div>
    </div>
  );
};
