import { firebaseStorage } from "../firebase/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

/**
 * Upload image to Firebase Storage
 * @param file File to upload
 * @param path Optional folder path inside Firebase
 * @returns Promise<string> downloadURL
 */
export async function uploadImageCustom(file: File, path = "community/images") {
    return new Promise<string>((resolve, reject) => {
        try {
            const fileName = `${Date.now()}-${file.name}`;
            const fileRef = ref(firebaseStorage, `${path}/${fileName}`);

            const uploadTask = uploadBytesResumable(fileRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // optional: progress logic here
                },
                (error) => {
                    console.error("🔥 Upload error:", error);
                    reject(error);
                },
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(url);
                }
            );
        } catch (err) {
            reject(err);
        }
    });
}
