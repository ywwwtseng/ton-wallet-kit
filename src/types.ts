export interface SendTransactionRequestMessage {
  /**
   * Receiver's address.
   */
  address: string;
  /**
   * Amount to send in nanoTon.
   */
  amount: string;
  /**
   * Contract specific data to add to the transaction.
   */
  stateInit?: string;
  /**
   * Contract specific data to add to the transaction.
   */
  payload?: string;
  /**
   * Extra currencies to send.
   */
  extraCurrency?: {
    [k: number]: string;
  };
}
