import Writable from "../Writable";

class Pipe {
  constructor(
    public readonly destination: Writable,
    public readonly listener: () => void,
  ) {}
}

export default Pipe;
