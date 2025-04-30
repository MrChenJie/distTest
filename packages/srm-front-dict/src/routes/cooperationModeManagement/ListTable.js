import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';
import { operatorRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';

const prompt = 'spfmhk.dict';
const language = getCurrentLanguage();
@formatterCollections({ code: [prompt] })

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  @Bind()
  handleApplicationLink(record) {
    if (record?.publichCaseId) {
      window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.publichCaseId}`);
    } else {
      window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_DICTGGSP&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/dict/cooperation-mode-management/detail?modeNoticeId=${record.modeNoticeId}&pageType=detail&caseId=${record.publichCaseId}`)}`);
    }
  };

  @Bind()
  handleExpireLink(record) {
    if(record?.expireCaseId) {
      window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.expireCaseId}`);
    } else {
      window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_DICTGGSP&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/dict/cooperation-mode-management/detail?modeNoticeId=${record.modeNoticeId}&pageType=detail&caseId=${record.expireCaseId}`)}`);
    }
  }

  @Bind()
  changeCopy(record) {
    //进入该id的详情页，但是提交的时候不带id，即为新建
    // window.open(`/pub/dict/cooperation-mode-management/detail?formRecordId=${record.modeNoticeId}&pageType=copy`, '_blank');
    window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_DICTGGSP&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/dict/cooperation-mode-management/detail?modeNoticeId=${record.modeNoticeId}&pageType=copy`)}`);
  };

  @Bind()
  changeLapse(record) {
    //进入详情页,填写失效原因
    // window.open(`/pub/dict/cooperation-mode-management/detail?formRecordId=${record.modeNoticeId}&pageType=lapse`, '_blank');
    window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_DICTHZXZ&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/dict/cooperation-mode-management/detail?modeNoticeId=${record.modeNoticeId}&pageType=lapse`)}`);
    // window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_DICTHZXZ&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/dict/cooperation-mode-management/detail?pageType=lapse`)}`);
  };

  render() {
    const {
      rowSelection,
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
      idpValueMap,
    } = this.props;
    const columns = [
      {
        title: intl.get(`spfmhk.dict.view.field.applicationno`).d('申请单号'),
        width: 160,
        dataIndex: 'applyNum',
        key: 'applyNum',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleApplicationLink(record)}>
              {tooltipRender(record.applyNum)}
            </a>
          );
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.ineffectiveno`).d('失效单号'),
        width: 160,
        dataIndex: 'applyExpireNum',
        key: 'applyExpireNum',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleExpireLink(record)}>
              {tooltipRender(record.applyExpireNum)}
            </a>
          );
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.cooperationmode`).d('合作模式'),
        width: 200,
        dataIndex: language === 'zh_CN' ? 'modeTypeChSimple' : 'modeTypeEn',
        key: language === 'zh_CN' ? 'modeTypeChSimple' : 'modeTypeEn',
      },
      {
        title: intl.get(`spfmhk.dict.view.field.applicant`).d('创建人'),
        width: 250,
        dataIndex: 'createUserName',
        key: 'createUserName',
      },
      // {
      //   title: intl.get(`spfmhk.dict.view.field.applicantionstatus`).d('申请状态'),
      //   width: 160,
      //   dataIndex: 'applyStatus',
      //   key: 'applyStatus',
      //   render: (_, record) => {
      //     const meaning = idpValueMap['DICT.COOPERATE_APPLY_STATUS']?.filter(i => i?.value === record.applyStatus)[0]?.meaning;
      //     return <>{meaning}</>;
      //   },
      // },
      {
        title: intl.get(`spfmhk.dict.view.field.applicantionstatus`).d('申请状态'),
        width: 160,
        dataIndex: 'applyStatusMeaning',
        key: 'applyStatusMeaning',
      },
      {
        title: intl.get(`spfmhk.dict.view.field.serisno`).d('排序'),
        width: 100,
        dataIndex: 'modeOrder',
        key: 'modeOrder',
      },
      {
        title: intl.get(`spfmhk.dict.view.field.creationdate`).d('创建日期'),
        width: 160,
        dataIndex: 'creationDate',
        key: 'creationDate',
        render: dateRender,
      },
      {
        title: intl.get('spfmhk.dict.view.field.operate').d('操作'),
        key: 'action',
        width: 160,
        fixed: 'right',
        // align:'center',
        render: (_, record) => {
          const operators = [
            {
              key: 'copy',
              ele: (
                <a
                  onClick={() => {
                    this.changeCopy(record);
                  }}
                >
                  {intl.get('spfmhk.dict.view.button.copy').d('复制')}
                </a>
              ),
              len: 3,
              title: intl.get('spfmhk.dict.view.button.copy').d('复制'),
            }];
          // 仅申请状态为已完成才有失效操作
          if (record.applyStatus === 'FINISHED' && !record.applyExpireNum) {
            operators.push(
              {
                key: 'lapse',
                ele: (
                  <a
                    onClick={() => {
                      this.changeLapse(record);
                    }}
                  >
                    {intl.get('spfmhk.dict.view.button.ineffecctive').d('失效')}
                  </a>
                ),
                len: 3,
                title: intl.get('spfmhk.dict.view.button.ineffecctive').d('失效'),
              },
            );
          }
          return operatorRender(operators);

        },
      },
    ];
    return (
      <>
        <CusTable
          rowKey="modeNoticeId"
          pagination={pagination}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
