import React from 'react';
import cusRequest from '_cus_utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import CusNotification from '@/components/CusNotification';
import { isFunction, isArray, isEmpty, isEqual, map } from 'lodash';
import { Select, Tooltip } from 'antd';
import tipIcon from '@/assets/tips.svg';
import './index.less';

/**
 * 统一查询独立、SQL、URL类型的值集
 * @param {{organizationId: *, tenantId: *}} params - 额外的查询参数
 * @param {String} params.lovCode - 值集code
 */
async function queryUnifyIdpValue(params = {}) {
  return cusRequest(`${HZERO_PLATFORM}/v1/lovs/data`, {
    method: 'GET',
    query: params,
  });
}

function mapTo$Options({ options = [], valueField = 'value', displayField = 'meaning' }) {
  return map(options, opt => (
    { ...opt, value: opt[valueField], meaning: opt[displayField] }
  ));
}

export default class CusSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      $options: mapTo$Options({
        options: props.options,
        valueField: props.valueField,
        displayField: props.displayField,
      }),
      open: false,
    };
  }

  selectRef = React.createRef();

  componentDidMount() {
    this.handleDeal$Options();
  }

  handleDeal$Options = () => {
    const { lovCode, queryParams = {}, options, valueField, displayField } = this.props;
    let nowParams = queryParams || {};
    if (isFunction(queryParams)) {
      nowParams = queryParams();
    }
    if (lovCode) {
      nowParams.lovCode = lovCode;
    }
    if (options) {
      // 直接有 options
      this.setState({
        $options: mapTo$Options({ options, valueField, displayField }),
        shouldUpdateProps: {
          lovCode,
          queryParams: nowParams,
          options,
        },
      });
    } else {
      if (lovCode) {
        // 查询 lov
        queryUnifyIdpValue({ ...this.getTenantQueryParams(), ...nowParams }).then(
          this.handleQueryOk
        );
      }
    }
  };

  componentDidUpdate() {
    // 当 queryPrams 变动时,需要重新查询
    const { shouldUpdateProps: scu } = this.state;
    const { lovCode, queryParams = {}, options } = this.props;
    let nowParams = queryParams || {};
    if (isFunction(queryParams)) {
      nowParams = queryParams();
    }
    if (lovCode) {
      nowParams.lovCode = lovCode;
    }
    const shouldUpdateProps = {
      lovCode,
      queryParams: nowParams,
      options,
    };
    if (!isEqual(scu, shouldUpdateProps)) {
      this.handleDeal$Options();
    }
  }

  handleQueryOk = (res) => {
    const {
      lovCode,
      queryParams = {},
      options,
      valueField,
      displayField,
    } = this.props;
    let nowParams = queryParams || {};
    if (isFunction(queryParams)) {
      nowParams = queryParams();
    }
    if (lovCode) {
      nowParams.lovCode = lovCode;
    }
    let $options;
    if (isEmpty(res)) {
      $options = [];
    } else if (isArray(res)) {
      // 没有分页的返回
      $options = mapTo$Options({ options: res, valueField, displayField });
    } else if (res.failed) {
      // 出错
      CusNotification.error({ message: res.message });
    } else {
      // 有分页的返回
      $options = mapTo$Options({ options: res.content, valueField, displayField });
    }
    this.setState({
      shouldUpdateProps: {
        lovCode,
        queryParams: nowParams,
        options,
      },
      $options,
    });
  };

  getTenantQueryParams = () => {
    const organizationId = getCurrentOrganizationId();
    return {
      organizationId,
      tenantId: organizationId,
    };
  };

  render() {
    const { tip, lovCode, children, virtual = true, ...other } = this.props;
    const { $options } = this.state;
    const commonProps = {
      ...other,
      options: !children && $options?.map((item) => ({ ...item, label: item.meaning })),
      popupClassName: 'customize-select',
      virtual, // 关闭虚拟滚动
      notFoundContent: intl.get('hzero.common.components.noticeIcon.null').d('暂无数据'),
      open: this.state.open,
      onKeyDown: (e) => {
        if (e.keyCode === 9) return false;
        if (e.keyCode === 13 && e.target) {
          e.preventDefault();
          this.setState({
            open: false,
          });
          const form = e.target.closest('form');
          const submitBtn = form && form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.click();
          }
          return false;
        } else {
          this.setState({
            open: true,
          });
        }
      },
      onClick: () => {
        const { mode } = this.props;
        const { open } = this.state;
        if((mode === 'multiple' || mode === 'tags') && open){
          return false;
        }
        this.setState({
          open: !open,
        });
      },
      onBlur: () => {
        this.setState({
          open: false,
        });
      },
    };
    return (
      <div className={`_cus_select_tooltip ${tip ? '_cus_select_clear' : ''}`}>
        <Select {...commonProps}>{children}</Select>
        {tip && (
          <Tooltip
            title={tip}
            overlayClassName="customize-tooltip"
            color={'#646A73'}
            trigger="hover"
          >
            <img src={tipIcon} alt="tip" className="_cus_tooltip_img" />
          </Tooltip>
        )}
      </div>
    );
  }
}
