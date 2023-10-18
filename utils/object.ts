class MyObj {
	// pick selected field from object
	pick = (obj: any, arr: string[]): object => arr.reduce((acc: any, curr: string) => (curr in obj && (acc[curr] = obj[curr]), acc), {});
	// kick selected field from object
	omit = (obj: any, arr: string[]): object =>
		Object.keys(obj)
			.filter((k: string) => !arr.includes(k))
			.reduce((acc: any, key: string) => ((acc[key] = obj[key]), acc), {});
}
const Obj = new MyObj();

export default Obj;
