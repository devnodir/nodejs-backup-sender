export default (name: string, def?: string): string => {
	if (process.env[name]) {
		return process.env[name] || "";
	}
	return def || "";
};
