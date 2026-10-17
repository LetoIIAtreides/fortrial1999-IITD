package org.aarogyalink.data.remote

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    // 10.0.2.2 is the loopback alias to host machine localhost in standard Android Emulator
    private const val DEFAULT_BASE_URL = "http://10.0.2.2:8000/"

    private var currentBaseUrl = DEFAULT_BASE_URL
    private var cachedService: AarogyaApiService? = null

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

    fun getApiService(customUrl: String? = null): AarogyaApiService {
        val targetUrl = customUrl ?: currentBaseUrl
        if (cachedService != null && currentBaseUrl == targetUrl) {
            return cachedService!!
        }

        currentBaseUrl = targetUrl
        val retrofit = Retrofit.Builder()
            .baseUrl(targetUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        val service = retrofit.create(AarogyaApiService::class.java)
        cachedService = service
        return service
    }

    fun setCustomBaseUrl(url: String) {
        currentBaseUrl = if (url.endsWith("/")) url else "$url/"
        cachedService = null
    }
}
