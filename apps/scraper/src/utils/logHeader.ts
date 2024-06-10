const logHeader = (message: string, newlineBefore = false, newlineAfter = false) => {
  if (newlineBefore) {
    console.log('');
  }
  console.log('--------------------------------------');
  console.log(message);
  console.log('--------------------------------------');
  if (newlineAfter) {
    console.log('');
  }
};

export default logHeader;
