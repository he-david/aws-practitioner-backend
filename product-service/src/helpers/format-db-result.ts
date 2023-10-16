export const formatDBResult = (output: any): object[] => {
  return output.Items.map((item) => {
    const newItem = {};
    Object.entries(item).forEach(([key, value]) => {
      newItem[key] = Object.values(value)[0];
    });
    return newItem;
  });
};
