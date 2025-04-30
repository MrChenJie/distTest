/**
 * @Description: 供应商账号生成 - 分配菜单权限
 * @date 2022-12-15
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { PureComponent, useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { isEmpty, isString } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Checkbox, Form, Row, Col, Input } from 'antd';
import { EMAIL } from 'utils/regExp';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';

import CusButton from '_cus_components/CusButton';
import CusSpin from '_cus_components/CusSpin';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusSelect from '_cus_components/CusSelect';
import CusNotification from '_cus_components/CusNotification';
import Table from './VirtualTable';
import styles from './index.less';

const FormItem = Form.Item;
const EDIT_FORM_ITEM_LAYOUT = {
  wrapperCol: { span: 24 },
};
const PermissionsQueryForm = ({
  onRef,
  infoData = {},
  userData = {},
  idpValueMap = {},
  loading = false,
}) => {
  const form = useRef();
  const [span, setSpan] = useState(8);
  const [multipleColDefaultWidth, setMultipleColDefaultWidth] = useState(0);
  useEffect(() => {
    onRef(form);
  })
  if (isEmpty(userData) || isEmpty(infoData)) {
    return (<div />);
  };
  return (
    <CusSpin spinning={loading}>
      <Form ref={form} className="customize-form">
        <Row>
          <Col span={8}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spfmhk.supplier.view.table.supplier.num`).d('供应商编号')}
              name="companyNum"
              initialValue={infoData.companyNum}
            >
              <Input disabled />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spfm.companyAccountRec.basic.info.companyName.en`).d('公司名称(英文)')}
              name="companyNameEn"
              initialValue={infoData.companyNameEn}
            >
              <Input disabled />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spfm.companyAccountRec.basic.info.companyName.cn`).d('公司名称(中文)')}
              name="companyName"
              initialValue={infoData.companyName}
            >
              <Input disabled />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spfm.companyAccountRec.model.permissions.email`).d('企业邮箱')}
              name="companyEmail"
              initialValue={infoData.companyEmail}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfm.companyAccountRec.model.permissions.email`).d('企业邮箱'),
                  }),
                },
                {
                  pattern: EMAIL,
                  message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                },
                {
                  max: 128,
                  message: intl.get('hzero.common.validation.max', {
                    max: 128,
                  }),
                },
              ]}
            >
              <Input />
            </FormItem>
          </Col>
          {/* <Col span={8}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spfm.companyAccountRec.model.permissions.loginname`).d('登录账号')}
              name="loginname"
              initialValue={userData.loginname}
            >
              <Input disabled />
            </FormItem>
          </Col> */}
          <Col span={8}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`spfm.companyAccountRec.model.permissions.startDateActive`)
                .d('有效日期从')}
              name="startDateActive"
              initialValue={
                userData.startDateActive
                  ? dayjs(userData.startDateActive)
                  : undefined
              }
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('spfm.companyAccountRec.model.permissions.startDateActive').d('有效日期从'),
                  }),
                },
              ]}
            >
              <CusDatePicker
                style={{ width: '100%' }}
                placeholder={intl
                  .get('hzero.common.view.message.selectDate')
                  .d('请选择日期')}
                disabledDate={(current) => {
                  return (
                    dayjs.isDayjs(current) &&
                    dayjs.isDayjs(form?.current?.getFieldValue('endDateActive')) &&
                    current.isAfter(form?.current?.getFieldValue('endDateActive'))
                  );
                }}
              />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spfm.companyAccountRec.model.permissions.endDateActive`).d('有效日期至')}
              name="endDateActive"
              initialValue={userData.endDateActive ? dayjs(userData.endDateActive) : undefined}
            >
              <CusDatePicker
                style={{ width: '100%' }}
                placeholder={intl
                  .get('hzero.common.view.message.selectDate')
                  .d('请选择日期')}
                disabledDate={(current) => {
                  return (
                    dayjs.isDayjs(current) &&
                    dayjs.isDayjs(form?.current?.getFieldValue('startDateActive')) &&
                    current.isBefore(form?.current?.getFieldValue('startDateActive'))
                  );
                }}
              />
            </FormItem>
          </Col>
          {/* <Col span={span}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spfm.companyAccountRec.model.permissions.produceType`).d('产品类型')}
              name="produceType"
              initialValue={
                isString(userData.produceType)
                  ? userData.produceType.split(',')
                  : undefined
              }
            >
              <CusSelect
                options={idpValueMap['ISP.RFP_PERMISSION_CONTROLS']}
                allowClear
                lazyLoad={false}
                mode="multiple"
                maxTagCount="responsive"
                // maxTagCount={2}
                // optionFilterProp="children"
                onChange={() => {
                  setTimeout(() => {
                    // 选择框元素
                    const multipleCol = document.querySelector(".ant-select-multiple");
                    // 选择框内被选中元素（数组）
                    const multipleEles = document.getElementsByClassName("ant-select-selection-overflow-item");
                    // 首次操作设置默认长度
                    if (multipleColDefaultWidth === 0) {
                      setMultipleColDefaultWidth(multipleCol.offsetWidth);
                    }
                    let totalWidth = 0;
                    for (let i = 0, len = multipleEles.length || 0; i < len - 1; i = i + 1 || 0) {
                      totalWidth += multipleEles[i].offsetWidth;
                    }
                    // 元素宽度和 > 当前选择框元素宽度，栅格加1份额（共3等份）；
                    if (totalWidth > multipleCol.offsetWidth - 20) {
                      if(span === 16) return;
                      setSpan(span + 8);
                    }
                    // 元素宽度和 < 默认选择框元素宽度，栅格置为1份额（共3等份）；
                    if (totalWidth < multipleColDefaultWidth - 20) {
                      setSpan(8);
                    }
                    // 元素宽度和为0，栅格置为1份额（共3等份）；
                    if (totalWidth === 0) {
                      setSpan(8);
                    }
                  }, 10);
                }}
              />
            </FormItem>
          </Col> */}
        </Row>
      </Form>
    </CusSpin>
  );
};

const WrapperPermissionsQueryForm = PermissionsQueryForm;

@fastCodeLoader(['ISP.RFP_PERMISSION_CONTROLS'])
@connect(({ loading, companyAccountRec }) => ({
  companyAccountRec,
  loading:
    loading.effects['companyAccountRec/fetchPermissionTree'] ||
    loading.effects['companyAccountRec/batchAssignPermissionSets'] ||
    loading.effects['companyAccountRec/batchUnAssignPermissionSets'],
  userDataLoading: loading.effects['companyAccountRec/fetchUserData'],
  saveUserDataLoading: loading.effects['companyAccountRec/updateUserData'],
}))
export default class Permissions extends PureComponent {
  constructor(props) {
    super(props);
    this.searchFormRef = React.createRef();
  }

  state = {
    dataSource: [],
    originDataSource: [],
    expandedRowKeys: [],
    defaultExpandedRowKeys: [],

    userData: {}, // 用户数据
  };

  componentDidMount() {
    this.handleFetchDataSource();
    this.fetchUserData();
  }

  @Bind
  handleFetchDataSource() {
    const { dispatch, infoData } = this.props;
    const { defaultRoleId: roleId, tenantId } = infoData;
    console.log("defaultRoleId: ", infoData, roleId, tenantId);
    if (roleId) {
      dispatch({
        type: 'companyAccountRec/fetchPermissionTree',
        roleId,
        tenantId,
      }).then((res) => {
        if (res) {
          const { dataSource = [], originDataSource = [], defaultExpandedRowKeys = [] } = res;
          this.setState({
            dataSource,
            originDataSource,
            defaultExpandedRowKeys,
          });
        }
      });
    }
  }

  @Bind
  fetchUserData() {
    const { dispatch, infoData = {} } = this.props;
    const { userId, tenantId } = infoData;
    dispatch({
      type: 'companyAccountRec/fetchUserData',
      payload: {
        userId,
        tenantId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          userData: res,
        });
      }
    });
  }

  @Bind
  onCheckboxChange(record) {
    const { infoData } = this.props;
    const { defaultRoleId: roleId, tenantId } = infoData;
    const { originDataSource } = this.state;

    // 分配权限需要获得子节点下的所有id，故需要先查找原始数据
    // eslint-disable-next-line no-unused-vars
    let originRecord = {};
    (function getOriginRecord(list = []) {
      list.forEach((n) => {
        if (n.id === record.id && n.parentId === record.parentId) {
          originRecord = n;
        } else if (!isEmpty(n.subMenus)) {
          return getOriginRecord(n.subMenus);
        } else {
          return {};
        }
      });
    })(originDataSource);

    const setIdList = [];
    const getSubSetIdList = (collections = []) => {
      collections.forEach((n) => {
        if (n.type === 'ps') {
          setIdList.push(n.id);
        }
        if (!isEmpty(n.subMenus)) {
          getSubSetIdList(n.subMenus);
        }
      });
    };

    if (originRecord.type === 'ps') {
      setIdList.push(originRecord.id);
    }

    if (!isEmpty(originRecord.subMenus)) {
      getSubSetIdList(originRecord.subMenus);
    }
    if (originRecord.checkedFlag !== 'Y') {
      this.batchAssignPermissionSets(roleId, tenantId, setIdList);
    } else {
      this.batchUnAssignPermissionSets(roleId, tenantId, setIdList);
    }
  }

  @Bind
  batchAssignPermissionSets(roleId, tenantId, data) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'companyAccountRec/batchAssignPermissionSets',
      payload: { roleId, tenantId, data },
    }).then((res) => {
      if (res && res.failed) {
        CusNotification.error({
          description: res.message,
        });
      } else {
        CusNotification.success();
        this.handleFetchDataSource();
      }
    });
  }

  @Bind
  batchUnAssignPermissionSets(roleId, tenantId, data) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'companyAccountRec/batchUnAssignPermissionSets',
      payload: { roleId, tenantId, data },
    }).then((res) => {
      if (res) {
        CusNotification.success();
        this.handleFetchDataSource();
      }
    });
  }

  /**
   * expandAll - 全部展开
   */
  @Bind
  expandAll() {
    const { defaultExpandedRowKeys } = this.state;
    this.setState({
      expandedRowKeys: defaultExpandedRowKeys,
    });
  }

  /**
   * expandAll - 全部收起
   */
  @Bind
  collapseAll() {
    this.setState({
      expandedRowKeys: [],
    });
  }

  /**
   * onExpand - 展开树
   * @param {boolean} expanded - 是否展开
   * @param {record} record - 当前行数据
   */
  @Bind
  onExpand(expanded, record) {
    const { expandedRowKeys = [] } = this.state;
    this.setState({
      expandedRowKeys: expanded
        ? expandedRowKeys.concat(record.key)
        : expandedRowKeys.filter((o) => o !== record.key),
    });
  }

  @Bind
  operationRender({ rowData: record }) {
    const checkboxProps = {
      indeterminate: record.checkedFlag === 'P',
      checked: record.checkedFlag === 'Y',
      onChange: () => this.onCheckboxChange(record),
    };
    return (
      <div className='cus-ant-checkbox'>
        <Checkbox {...checkboxProps} />
      </div>
    );
  }

  @Bind
  handleSave() {
    const { dispatch } = this.props;
    const { userData } = this.state;
    let values = {};
    if (this.searchFormRef.current) {
      values = this.searchFormRef.current.getFieldsValue();
    }
    console.log(values, this.searchFormRef);
    const { startDateActive, endDateActive, produceType = [] } = values;
    dispatch({
      type: 'companyAccountRec/updateUserData',
      payload: {
        ...userData,
        ...values,
        startDateActive: dayjs.isDayjs(startDateActive)
          ? startDateActive.format('YYYY-MM-DD')
          : undefined,
        endDateActive: dayjs.isDayjs(endDateActive)
          ? endDateActive.format('YYYY-MM-DD')
          : undefined,
        produceType: Array.isArray(produceType) ? produceType.join(';') : undefined,
        enabled: 1,
        locked: 0,
      },
    }).then((res) => {
      if (res) {
        CusNotification.success();
        this.fetchUserData();
      }
    });
  }

  render() {
    const {
      loading = false,
      userDataLoading = false,
      saveUserDataLoading = false,
      infoData,
      idpValueMap,
      onCancel = (e) => e,
    } = this.props;
    const { dataSource = [], expandedRowKeys = [], userData } = this.state;

    const columns = [
      {
        title: intl.get(`spfm.companyAccountRec.model.permissionSetName`).d('权限层级名称'),
        width: 400,
        dataIndex: 'name',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 550,
        render: this.operationRender,
      },
    ];
    const tableProps = {
      isTree: true,
      rowKey: 'key',
      columns,
      data: dataSource,
      loading,
      childrenColumnName: 'subMenus',
      pagination: false,
      expandedRowKeys,
      onExpandChange: this.onExpand,
      height: 300,
      scroll: { x: tableScrollWidth(columns) }
    };
    return (
      <div>
        <WrapperPermissionsQueryForm
          onRef={ref => {
            this.searchFormRef = ref;
          }}
          infoData={infoData}
          userData={userData}
          idpValueMap={idpValueMap}
          loading={userDataLoading}
        />
        <Table {...tableProps} />
        <div className={styles.operations} style={{ marginTop: '20px' }}>
          <CusButton onClick={onCancel}>
            {intl.get('hzero.common.view.button.cancel').d('取消')}
          </CusButton>
          <CusButton type="primary" onClick={this.handleSave} loading={saveUserDataLoading}>
            {intl.get('hzero.common.button.confirm').d('确认')}
          </CusButton>
        </div>
      </div>
    );
  }
}
