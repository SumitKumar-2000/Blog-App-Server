exports.rawQueryFormatDate = (dateKey, dateformat = "DD-MM-YYYY") => {
  return `TO_CHAR(${dateKey} , '${dateformat}')`;
};

exports.generateRowId = () => {
  return `CONCAT(TO_CHAR(NOW(), 'YYYYMMDDHH24MISS'),FLOOR(RANDOM() * 1000000))`;
};
