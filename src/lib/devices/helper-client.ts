export type DeviceCommand =
  | "open_cash_drawer"
  | "print_receipt"
  | "print_label"
  | "read_scale_weight"
  | "get_printer_status"
  | "get_cash_drawer_status"

export interface DeviceCommandResult {
  success: boolean
  status: "available" | "unavailable" | "error"
  message: string
  data?: unknown
}

export function isDeviceHelperAvailable(): boolean {
  return false
}

export async function sendCommandToHelper(
  _command: DeviceCommand,
  _params?: Record<string, unknown>
): Promise<DeviceCommandResult> {
  return {
    success: false,
    status: "unavailable",
    message: "هذه الميزة ستتوفر عند تثبيت ENJAZ Device Helper.",
  }
}

export async function openCashDrawer(): Promise<DeviceCommandResult> {
  return sendCommandToHelper("open_cash_drawer")
}

export async function printEscPosReceipt(
  _receiptData: unknown
): Promise<DeviceCommandResult> {
  return sendCommandToHelper("print_receipt")
}

export async function readScaleWeight(): Promise<DeviceCommandResult> {
  return sendCommandToHelper("read_scale_weight")
}
