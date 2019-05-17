// tslint:disable-next-line:class-name
class ERR_METHOD_NOT_IMPLEMENTED extends Error {
  constructor(method: string) {
    super(`The "${method}" method is not implemented`);
  }
}

export default ERR_METHOD_NOT_IMPLEMENTED;
