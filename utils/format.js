function formatData(data) {
  const formatted = [];
  for (const row of data) {
    const newRow = {};
    newRow.id = row._id.valueOf();
    newRow.userId = row.userId.valueOf();
    newRow.name = row.name;
    newRow.type = row.type;
    newRow.isPublic = row.isPublic;
    if (row.parentId === '0') {
      newRow.parentId = '0';
    } else {
      newRow.parentId = row.parentId.valueOf();
    }
    formatted.push(newRow);
  }
  return formatted;
}

module.exports = formatData;
