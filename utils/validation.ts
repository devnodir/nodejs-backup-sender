import { AnySchema, CustomHelpers } from "joi";
import { PHONE_PATTERN } from "./patters";

export const defaultAlter = { POST: (v: AnySchema) => v.required(), PATCH: (v: AnySchema) => v.optional() };

export const validPhone = (value: number, helpers: CustomHelpers) => {
	const result = new RegExp(PHONE_PATTERN).test(value.toString());
	if (!result) return helpers.error("any.invalid");
	return value;
};
