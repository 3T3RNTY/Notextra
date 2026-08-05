package com.notextra.shared.storage;

import com.notextra.shared.NotextraProperties;
import java.time.Duration;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@Service
public class ObjectStorageService {

	private final S3Client s3Client;
	private final NotextraProperties properties;

	public ObjectStorageService(S3Client s3Client, NotextraProperties properties) {
		this.s3Client = s3Client;
		this.properties = properties;
	}

	public String createUploadUrl(String storageKey, String contentType) {
		ensureBucketExists();
		try (S3Presigner presigner = buildPresigner()) {
			var putRequest = PutObjectRequest.builder()
				.bucket(properties.storage().bucket())
				.key(storageKey)
				.contentType(contentType)
				.build();
			var presignRequest = PutObjectPresignRequest.builder()
				.signatureDuration(Duration.ofMinutes(15))
				.putObjectRequest(putRequest)
				.build();
			return presigner.presignPutObject(presignRequest).url().toString();
		}
	}

	public String createDownloadUrl(String storageKey) {
		ensureBucketExists();
		try (S3Presigner presigner = buildPresigner()) {
			var getRequest = GetObjectRequest.builder()
				.bucket(properties.storage().bucket())
				.key(storageKey)
				.build();
			var presignRequest = GetObjectPresignRequest.builder()
				.signatureDuration(Duration.ofMinutes(15))
				.getObjectRequest(getRequest)
				.build();
			return presigner.presignGetObject(presignRequest).url().toString();
		}
	}

	private S3Presigner buildPresigner() {
		var storage = properties.storage();
		return S3Presigner.builder()
			.endpointOverride(java.net.URI.create(storage.endpoint()))
			.region(software.amazon.awssdk.regions.Region.US_EAST_1)
			.credentialsProvider(software.amazon.awssdk.auth.credentials.StaticCredentialsProvider.create(
				software.amazon.awssdk.auth.credentials.AwsBasicCredentials.create(storage.accessKey(), storage.secretKey())
			))
			.serviceConfiguration(software.amazon.awssdk.services.s3.S3Configuration.builder().pathStyleAccessEnabled(true).build())
			.build();
	}

	private void ensureBucketExists() {
		String bucket = properties.storage().bucket();
		try {
			s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
		}
		catch (NoSuchBucketException ex) {
			s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
		}
	}
}
