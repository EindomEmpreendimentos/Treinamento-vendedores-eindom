import { toast, type ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ToastMessage = string | React.ReactNode;

const opcoesToast: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  closeButton: false,
  theme: "light",
};

const Toast = {
  /**
   * @deprecated mostrarToastInfo está obsoleta e deve ser removida em breve. Use Toast.informacao() em vez disso.
   */
  mostrarToastInfo: (mensagem: ToastMessage) => toast.info(mensagem, opcoesToast),

  /**
   * @deprecated mostrarToastWarning está obsoleta e deve ser removida em breve. Use Toast.aviso() em vez disso.
   */
  mostrarToastWarning: (mensagem: ToastMessage) =>
    toast.warning(mensagem, opcoesToast),

  /**
   * @deprecated mostrarToastError está obsoleta e deve ser removida em breve. Use Toast.erro() em vez disso.
   */
  mostrarToastError: (mensagem: ToastMessage) => toast.error(mensagem, opcoesToast),

  /**
   * @deprecated mostrarToastMensagem está obsoleta e deve ser removida em breve. Use Toast.mensagem() em vez disso.
   */
  mostrarToastMensagem: (mensagem: ToastMessage) => toast(mensagem, opcoesToast),

  // ✅ API atual (você já usa)
  erro: (mensagem: ToastMessage) => Toast.mostrarToastError(mensagem),
  informacao: (mensagem: ToastMessage) => Toast.mostrarToastInfo(mensagem),
  aviso: (mensagem: ToastMessage) => Toast.mostrarToastWarning(mensagem),
  mensagem: (mensagem: ToastMessage) => Toast.mostrarToastMensagem(mensagem),

  // ✅ (opcional) aliases curtos se quiser usar no futuro
  info: (mensagem: ToastMessage) => Toast.informacao(mensagem),
  warn: (mensagem: ToastMessage) => Toast.aviso(mensagem),
  success: (mensagem: ToastMessage) => toast.success(mensagem, opcoesToast),
};

export default Toast;
