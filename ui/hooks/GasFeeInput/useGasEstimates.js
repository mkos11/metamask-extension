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

import { useCurrencyDisplay } from '../useCurrencyDisplay';
import { useUserPreferencedCurrency } from '../useUserPreferencedCurrency';

export function useGasEstimates({
  editGasMode,
  gasEstimateType,
  gasFeeEstimates,
  gasLimit,
  gasPrice,
  maxFeePerGas,
  maxFeePerGasFiat,
  maxPriorityFeePerGas,
  minimumGasLimit,
  supportsEIP1559,
}) {
  const {
    currency: fiatCurrency,
    numberOfDecimals: fiatNumberOfDecimals,
  } = useUserPreferencedCurrency(SECONDARY);

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
  };
  if (supportsEIP1559) {
    gasSettings.maxFeePerGas = maxFeePerGas
      ? decGWEIToHexWEI(maxFeePerGas)
      : decGWEIToHexWEI(gasPrice || '0');
    gasSettings.maxPriorityFeePerGas = maxPriorityFeePerGas
      ? decGWEIToHexWEI(maxPriorityFeePerGas)
      : gasSettings.maxFeePerGas;
    gasSettings.baseFeePerGas = decGWEIToHexWEI(
      gasFeeEstimates.estimatedBaseFee ?? '0',
    );
  } else if (gasEstimateType === GAS_ESTIMATE_TYPES.NONE) {
    gasSettings.gasPrice = '0x0';
  } else {
    gasSettings.gasPrice = decGWEIToHexWEI(gasPrice);
  }

  // const gasSettings = {
  //   gasLimit: decimalToHex(gasLimit || '0'),
  //   gasPrice:
  //     !supportsEIP1559 && gasEstimateType !== GAS_ESTIMATE_TYPES.NONE
  //       ? decGWEIToHexWEI(gasPrice || '0')
  //       : undefined,
  //   maxFeePerGas: supportsEIP1559
  //     ? decGWEIToHexWEI(maxFeePerGas || gasPrice || '0')
  //     : undefined,
  //   maxPriorityFeePerGas: supportsEIP1559
  //     ? decGWEIToHexWEI(maxPriorityFeePerGas || maxFeePerGas || gasPrice || '0')
  //     : undefined,
  //   baseFeePerGas: supportsEIP1559
  //     ? decGWEIToHexWEI(gasFeeEstimates.estimatedBaseFee ?? '0')
  //     : undefined,
  // };

  // The maximum amount this transaction will cost
  const maximumCostInHexWei = getMaximumGasTotalInHexWei(gasSettings);

  const minGasSettings = {};
  if (editGasMode === EDIT_GAS_MODES.SWAPS) {
    minGasSettings.gasLimit = decimalToHex(minimumGasLimit);
  }

  // The minimum amount this transaction will cost's
  const minimumCostInHexWei = getMinimumGasTotalInHexWei({
    ...gasSettings,
    ...minGasSettings,
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
    minimumCostInHexWei,
  };
}
