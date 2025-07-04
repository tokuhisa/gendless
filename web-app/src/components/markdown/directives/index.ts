import { Button } from './Button';
import { JavaScriptExecutor } from './JavaScriptExecutor';
import { ResultDisplay } from './ResultDisplay';
import { TextInput } from './TextInput';

export { directiveHandler } from './directiveHandler';
export const components = {
  js: JavaScriptExecutor,
  textinput: TextInput,
  button: Button,
  resultdisplay: ResultDisplay,
};