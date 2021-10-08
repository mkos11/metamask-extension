import { useSelector } from 'react-redux';

import {
  EDIT_GAS_MODES,
  GAS_ESTIMATE_TYPES,
} from '../../../shared/constants/gas';
import {
  getMaximumGasTotalInHexWei,
  getMinimumGasTotalInHexWei,
} from '../../../shared/modules/gas.utils';

import { getShouldShowFiat } from '../../selectors';
import { PRIMARY, SECONDARY } from '../../helpers/constants/common';
import {
  decGWEIToHexWEI,
  decimalToHex,
} from '../../helpers/utils/conversions.util';

import { useGasFeeEstimates } from '../useGasFeeEstimates';
import { useCurrencyDisplay } from '../useCurrencyDisplay';
import { useUserPreferencedCurrency } from '../useUserPreferencedCurrency';

export function useGasEstimates(
  gasLimit,
  supportsEIP1559,
  gasPrice,
  maxFeePerGas,
  maxPriorityFeePerGas,
  editGasMode,
  maxFeePerGasFiat,
  minimumGasLimit,
) {
  const {
    currency: fiatCurrency,
    numberOfDecimals: fiatNumberOfDecimals,
  } = useUserPreferencedCurrency(SECONDARY);

  const { gasEstimateType, gasFeeEstimates } = useGasFeeEstimates();

  const showFiat = useSelector(getShouldShowFiat);

  const {
    currency: primaryCurrency,
    numberOfDecimals: primaryNumberOfDecimals,
  } = useUserPreferencedCurrency(PRIMARY);

  // We have two helper methods that take an object that can have either
  // gasPrice OR the EIP-1559 fields on it, plus gasLimit. This object is
  // conditionally set to the appropriate fields to compute the minimum
  // and maximum cost of a transaction given the current estimates or selected
  // gas fees.
  const gasSettings = {
    gasLimit: decimalToHex(gasLimit),
    gasPrice:
      !supportsEIP1559 && gasEstimateType !== GAS_ESTIMATE_TYPES.NONE
        ? decGWEIToHexWEI(gasPrice)
        : undefined,
    maxFeePerGas: supportsEIP1559
      ? decGWEIToHexWEI(maxFeePerGas || gasPrice || '0')
      : undefined,
    maxPriorityFeePerGas: supportsEIP1559
      ? decGWEIToHexWEI(maxPriorityFeePerGas || maxFeePerGas || gasPrice || '0')
      : undefined,
    baseFeePerGas: supportsEIP1559
      ? decGWEIToHexWEI(gasFeeEstimates.estimatedBaseFee ?? '0')
      : undefined,
  };

  // The maximum amount this transaction will cost
  const maximumCostInHexWei = getMaximumGasTotalInHexWei(gasSettings);

  // The minimum amount this transaction will cost's
  const minimumCostInHexWei = getMinimumGasTotalInHexWei({
    ...gasSettings,
    gasLimit:
      editGasMode === EDIT_GAS_MODES.SWAPS
        ? decimalToHex(minimumGasLimit)
        : undefined,
  });

  // We need to display the total amount of native currency will be expended
  // given the selected gas fees.
  const [estimatedMaximumNative] = useCurrencyDisplay(maximumCostInHexWei, {
    numberOfDecimals: primaryNumberOfDecimals,
    currency: primaryCurrency,
  });

  const [estimatedMinimumNative] = useCurrencyDisplay(minimumCostInHexWei, {
    numberOfDecimals: primaryNumberOfDecimals,
    currency: primaryCurrency,
  });

  // We also need to display our closest estimate of the low end of estimation
  // in fiat.
  const [, { value: estimatedMinimumFiat }] = useCurrencyDisplay(
    minimumCostInHexWei,
    {
      numberOfDecimals: fiatNumberOfDecimals,
      currency: fiatCurrency,
    },
  );

  return {
    estimatedMinimumFiat: showFiat ? estimatedMinimumFiat : '',
    estimatedMaximumFiat: showFiat ? maxFeePerGasFiat : '',
    estimatedMaximumNative,
    estimatedMinimumNative,
    estimatedBaseFee: supportsEIP1559
      ? decGWEIToHexWEI(gasFeeEstimates.estimatedBaseFee ?? '0')
      : undefined,
  };
}
