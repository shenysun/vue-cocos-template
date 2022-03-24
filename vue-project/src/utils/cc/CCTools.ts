const global = window as any;
/**
 * SystemJs import
 * @param url
 * @returns
 */
export function topLevelImport(url: string): Promise<any> {
    return global.System.import(''.concat(url));
}

/**
 * SystemJs 批量import
 * @param packs
 * @returns
 */
export function loadModulePacks(packs: Array<string>) {
    return Promise.all(
        packs.map((pack) => {
            return topLevelImport(pack);
        }),
    );
}

/**
 * 批量通过document引入方式下载js文件
 * @param jsList
 * @returns
 */
export function loadJsList(jsList: Array<string>) {
    let promise: any;
    jsList.forEach((jsFile) => {
        promise = promise.then(() => {
            return loadJSFile('src/'.concat(jsFile));
        });
    });

    return promise;
}

/**
 * 通过document引入方式下载js文件
 * @param url
 * @returns
 */
export function loadJSFile(url: string, prefix?: string) {
    return new Promise((resolve, reject) => {
        let err: any;

        const windowErrorListener = (evt: any) => {
            if (evt.filename === url) {
                err = evt.error;
            }
        };

        window.addEventListener('error', windowErrorListener);
        const script = document.createElement('script');
        script.charset = 'utf-8';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.addEventListener('error', () => {
            window.removeEventListener('error', windowErrorListener);
            reject(Error('Error loading ' + url));
        });
        script.addEventListener('load', () => {
            window.removeEventListener('error', windowErrorListener);
            document.head.removeChild(script);

            if (err) {
                reject(err);
            } else {
                resolve(null);
            }
        });
        if (prefix) {
            script.src = `${prefix}${url}`;
        } else {
            script.src = url;
        }
        document.head.appendChild(script);
    });
}

export async function fetchWasm(url: string) {
    const response = await fetch(url);
    return await response.arrayBuffer();
}
