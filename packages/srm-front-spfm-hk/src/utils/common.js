import moment from "moment";
import { subtract, isNumber } from 'lodash';
import intl from 'utils/intl';

export function getCircleScoreDataSource(previewDetail, enterpriseHeaderDetail, companyStateDataSource) {
  // 公司注册年资
  let yearScore;
  const companyRegistrationYear = subtract(moment(new Date()).year(), moment( previewDetail.companyBasicDTO.buildDate, 'YYYY').year());
  if(companyRegistrationYear < 2) {
    yearScore = 0;
  }else if( companyRegistrationYear >= 2 && companyRegistrationYear < 3 ){
    yearScore = 1;
  }else if( companyRegistrationYear >= 3 && companyRegistrationYear < 4 ){
    yearScore = 2;
  }else if( companyRegistrationYear >= 4 && companyRegistrationYear < 5 ) {
    yearScore = 3;
  }else if( companyRegistrationYear >= 5 && companyRegistrationYear < 6 ) {
    yearScore = 4;
  }else if( companyRegistrationYear >= 6 ){
    yearScore = 5;
  }else {
    yearScore = 0;
  }
  // 公司注册资金（美金）
  let capitalScore;
  const { registeredCapital } = enterpriseHeaderDetail;
  if( registeredCapital < 50000 ){
    capitalScore = 1;
  }else if ( registeredCapital >= 50000 && registeredCapital < 80000 ){
    capitalScore = 2;
  }else if ( registeredCapital >= 80000 && registeredCapital < 100000 ){
    capitalScore = 3;
  }else if ( registeredCapital >= 100000 && registeredCapital < 130000 ){
    capitalScore = 4;
  }else if ( registeredCapital >= 130000 ){
    capitalScore = 5;
  }else {
    capitalScore = 1;
  }
  // 公司已上市
  let listedScore;
  const {listedFlag} = enterpriseHeaderDetail;
  if( listedFlag === 'Y' ){
    listedScore = 5;
  }else if ( listedFlag === 'N' ){
    listedScore = 1;
  }

  // 工程师能力
  let staffScore;
  let staffQuantity = 0;
  companyStateDataSource.forEach((item) => {
    staffQuantity += item.staffQuantity;
  });
  if( staffQuantity <= 1 ){
    staffScore = 1;
  }else if ( staffQuantity >= 2 && staffQuantity < 3 ){
    staffScore = 2;
  }else if ( staffQuantity >= 3 && staffQuantity < 4 ){
    staffScore = 3;
  }else if ( staffQuantity >= 4 && staffQuantity < 5 ){
    staffScore = 4;
  }else if ( staffQuantity >= 5 ){
    staffScore = 5;
  }

  // 子公司数量
  let subsidiaryScore;
  const {subsidiaryNumber} = enterpriseHeaderDetail;
  if( isNumber(subsidiaryNumber) ? (subsidiaryNumber < 1) : true ){
    subsidiaryScore = 1;
  }else if ( subsidiaryNumber >= 1 && subsidiaryNumber < 2){
    subsidiaryScore = 2;
  }else if ( subsidiaryNumber >= 2 && subsidiaryNumber < 3){
    subsidiaryScore = 3;
  }else if ( subsidiaryNumber >= 3 && subsidiaryNumber < 4){
    subsidiaryScore = 4;
  }else if ( subsidiaryNumber >= 4 ){
    subsidiaryScore = 5;
  }

  // 总分
  const totalScore = (yearScore + capitalScore + listedScore + staffScore + subsidiaryScore);

  return [
    {
      key: '1',
      ratingBackground: intl.get('spfm.enterpriseLine.view.label.yearScore').d('公司注册年资'),
      score: yearScore,
    },
    {
      key: '2',
      ratingBackground: intl.get('spfm.enterpriseLine.view.label.capitalScore').d('公司注册资金（美金）'),
      score: capitalScore,
    },
    {
      key: '3',
      ratingBackground: intl.get('spfm.enterpriseLine.view.label.listedScore').d('公司已上市'),
      score: listedScore,
    },
    {
      key: '4',
      ratingBackground: intl.get('spfm.enterpriseLine.view.label.staffScore').d('工程师能力'),
      score: staffScore,
    },
    {
      key: '5',
      ratingBackground: intl.get('spfm.enterpriseLine.view.label.subsidiaryScore').d('子公司数量'),
      score: subsidiaryScore,
    },
    {
      key: '6',
      ratingBackground: intl.get('spfm.enterpriseLine.view.label.totalScore').d('总分'),
      score: totalScore,
    },
  ];
}
