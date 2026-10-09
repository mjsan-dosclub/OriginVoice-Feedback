declare module "qrcode" {
  interface QrCodeApi {
    toDataURL(
      text: string,
      options?: {
        margin?: number;
        width?: number;
        color?: { dark?: string; light?: string };
      },
    ): Promise<string>;
  }
  const qrcode: QrCodeApi;
  export default qrcode;
}
