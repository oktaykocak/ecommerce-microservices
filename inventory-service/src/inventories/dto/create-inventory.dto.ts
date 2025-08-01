import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    Min,
    ValidateIf,
    Validate,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
  } from 'class-validator';
  
  @ValidatorConstraint({ name: 'RequireNameSkuIfIdMissing', async: false })
  class RequireNameSkuIfIdMissing implements ValidatorConstraintInterface {
    validate(_: any, args: ValidationArguments) {
      const obj = args.object as CreateInventoryDto;
      const idExists = !!obj.id;
      const nameExists = !!obj.name;
      const skuExists = !!obj.sku;
  
      if (!idExists) {
        return nameExists && skuExists;
      }
      return true;
    }
  
    defaultMessage(args: ValidationArguments) {
      return 'When "id" is not provided, both "name" and "sku" must be present.';
    }
  }
  
  export class CreateInventoryDto {
    @IsUUID(4)
    @IsOptional()
    id?: string;
  
    @ValidateIf((o) => !o.id)
    @IsNotEmpty({ message: 'Name is required when id is not provided' })
    name?: string;
  
    @ValidateIf((o) => !o.id)
    @IsNotEmpty({ message: 'SKU is required when id is not provided' })
    sku?: string;
  
    @IsInt()
    @Min(1)
    quantity: number;
  
    @Validate(RequireNameSkuIfIdMissing)
    dummyField?: string;
  }
  