export interface MarkdownViewProps {
  text: string;
}

export interface JavaScriptExecutorProps {
  children?: React.ReactNode;
  codeContent?: string;
}

export interface MyComponentProps {
  prop1?: string;
  prop2?: string;
  children?: React.ReactNode;
}

export interface TextInputProps {
  id?: string;
  placeholder?: string;
  defaultValue?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  required?: boolean;
  disabled?: boolean;
  label?: string;
  children?: React.ReactNode;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
}