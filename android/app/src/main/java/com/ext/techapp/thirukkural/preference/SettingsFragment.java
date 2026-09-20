package com.ext.techapp.thirukkural.preference;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import androidx.preference.PreferenceFragmentCompat;
import androidx.preference.PreferenceManager;

import com.ext.techapp.thirukkural.R;
import com.ext.techapp.thirukkural.notification.DailyCoupletReceiver;

import java.util.Calendar;

public class SettingsFragment extends PreferenceFragmentCompat implements SharedPreferences.OnSharedPreferenceChangeListener {

    @Override
    public void onCreatePreferences(Bundle savedInstanceState, String rootKey) {
        setPreferencesFromResource(R.xml.preferences, rootKey);
    }

    @Override
    public void onSharedPreferenceChanged(SharedPreferences sharedPreferences, String key) {
        if (key != null && key.equals(getString(R.string.prefDailyKuralNotification))) {
            Context context = getContext();
            if (context == null) return;
            SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(context);
            boolean syncConnPref = sharedPref.getBoolean(getString(R.string.prefDailyKuralNotification), false);
            scheduleNotification(syncConnPref);
            Log.d("syncConnPref", String.valueOf(syncConnPref));
        }
    }

    private void scheduleNotification(boolean syncConnPref) {
        Context context = getContext();
        if (context == null) return;

        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(System.currentTimeMillis());
        calendar.set(Calendar.HOUR_OF_DAY, 8);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);

        Calendar now = Calendar.getInstance();
        if (now.after(calendar)) {
            calendar.add(Calendar.DATE, 1);
        }

        Intent alarmIntent = new Intent(context, DailyCoupletReceiver.class);
        int pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            pendingFlags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context, 0, alarmIntent, pendingFlags);

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        if (syncConnPref) {
            alarmManager.setInexactRepeating(AlarmManager.RTC_WAKEUP, calendar.getTimeInMillis(),
                    AlarmManager.INTERVAL_DAY, pendingIntent);
        } else {
            alarmManager.cancel(pendingIntent);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (getPreferenceScreen() != null && getPreferenceScreen().getSharedPreferences() != null) {
            getPreferenceScreen().getSharedPreferences().registerOnSharedPreferenceChangeListener(this);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (getPreferenceScreen() != null && getPreferenceScreen().getSharedPreferences() != null) {
            getPreferenceScreen().getSharedPreferences().unregisterOnSharedPreferenceChangeListener(this);
        }
    }
}

