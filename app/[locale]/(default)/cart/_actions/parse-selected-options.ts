import { FragmentOf } from 'gql.tada';

import { DigitalItemFragment, PhysicalItemFragment } from '../page-data';

import { CartSelectedOptionsInput } from './update-quantity';

export type CartLineSelectedOptions =
  | FragmentOf<typeof PhysicalItemFragment>['selectedOptions']
  | FragmentOf<typeof DigitalItemFragment>['selectedOptions'];

// A cart line's selected options, as the add/update mutations want them back.
export const parseSelectedOptions = (
  selectedOptions: CartLineSelectedOptions,
): CartSelectedOptionsInput =>
  selectedOptions.reduce<CartSelectedOptionsInput>((accum, option) => {
    let multipleChoicesOptionInput;
    let checkboxOptionInput;
    let numberFieldOptionInput;
    let textFieldOptionInput;
    let multiLineTextFieldOptionInput;
    let dateFieldOptionInput;

    switch (option.__typename) {
      case 'CartSelectedMultipleChoiceOption':
        multipleChoicesOptionInput = {
          optionEntityId: option.entityId,
          optionValueEntityId: option.valueEntityId,
        };

        if (accum.multipleChoices) {
          return {
            ...accum,
            multipleChoices: [...accum.multipleChoices, multipleChoicesOptionInput],
          };
        }

        return {
          ...accum,
          multipleChoices: [multipleChoicesOptionInput],
        };

      case 'CartSelectedCheckboxOption':
        checkboxOptionInput = {
          optionEntityId: option.entityId,
          optionValueEntityId: option.valueEntityId,
        };

        if (accum.checkboxes) {
          return {
            ...accum,
            checkboxes: [...accum.checkboxes, checkboxOptionInput],
          };
        }

        return { ...accum, checkboxes: [checkboxOptionInput] };

      case 'CartSelectedNumberFieldOption':
        numberFieldOptionInput = {
          optionEntityId: option.entityId,
          number: option.number,
        };

        if (accum.numberFields) {
          return {
            ...accum,
            numberFields: [...accum.numberFields, numberFieldOptionInput],
          };
        }

        return { ...accum, numberFields: [numberFieldOptionInput] };

      case 'CartSelectedTextFieldOption':
        textFieldOptionInput = {
          optionEntityId: option.entityId,
          text: option.text,
        };

        if (accum.textFields) {
          return {
            ...accum,
            textFields: [...accum.textFields, textFieldOptionInput],
          };
        }

        return { ...accum, textFields: [textFieldOptionInput] };

      case 'CartSelectedMultiLineTextFieldOption':
        multiLineTextFieldOptionInput = {
          optionEntityId: option.entityId,
          text: option.text,
        };

        if (accum.multiLineTextFields) {
          return {
            ...accum,
            multiLineTextFields: [...accum.multiLineTextFields, multiLineTextFieldOptionInput],
          };
        }

        return {
          ...accum,
          multiLineTextFields: [multiLineTextFieldOptionInput],
        };

      case 'CartSelectedDateFieldOption':
        dateFieldOptionInput = {
          optionEntityId: option.entityId,
          date: new Date(option.date.utc).toISOString(),
        };

        if (accum.dateFields) {
          return {
            ...accum,
            dateFields: [...accum.dateFields, dateFieldOptionInput],
          };
        }

        return { ...accum, dateFields: [dateFieldOptionInput] };
    }

    return accum;
  }, {});
