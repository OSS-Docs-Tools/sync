export const ghRepresentationForPath = (value: string) => {
    const afterAt = value.includes("@") ? value.split("@")[1] : value
    return {
      branch: value.includes("#") ? value.split("#")[1] : "master",
      filePath: afterAt.split("#")[0],
      repoSlug: value.includes("@") ? value.split("@")[0] : value.split("#")[0],
      referenceString: value,
    }
  }