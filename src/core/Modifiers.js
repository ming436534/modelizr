const ModelModifiers = {
    only: Only => model => ({...model, Only}),
    without: Without => model => ({...model, Without})
}